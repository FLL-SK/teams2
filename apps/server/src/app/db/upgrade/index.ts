import debugLib from 'debug';
import mongoose from 'mongoose';
import { RegistrationData } from '../../models';
import { formatTeamNo } from '../../utils/format-teamNo';

export async function upgrade() {
  const debug = debugLib('upgrade');
  debug('DB Upgrade');
  await normalRegistrations();
  await initTeamRegistrationSequence();
  //await removeLightColor();
}

// accessing the database directly
// const et = await mongoose.connection.db.collection('t1_users').findOne({ email: u.username });

async function normalRegistrations() {
  const debug = debugLib('upgrade:normalRegistrations');
  debug('normalRegistrations');
  const et = mongoose.connection.db.collection('registrations').find({ type: null });
  for await (const r of et) {
    debug('updating registration %s', r._id);
    await mongoose.connection.db
      .collection('registrations')
      .updateOne(
        { _id: r._id },
        { $set: { type: 'NORMAL', impactedTeams: 0, impactedChildren: 0 } },
      );
  }
}

async function initTeamRegistrationSequence() {
  const debug = debugLib('upgrade:initTeamRegistrationSequence');
  debug('initTeamRegistrationSequence');
  const programs = mongoose.connection.db.collection('programs').find({ teamRegSequence: null });
  for await (const p of programs) {
    debug('updating program %s', p._id);
    // get teams registered for the program
    const q: Partial<RegistrationData> = { programId: p._id, canceledOn: null };
    const teams = await mongoose.connection.db
      .collection('registrations')
      .aggregate([{ $match: q }, { $group: { _id: '$teamId' } }])
      .toArray();
    // update program
    await mongoose.connection.db
      .collection('programs')
      .updateOne({ _id: p._id }, { $set: { teamRegSequence: teams.length + 1 } });
    // assign team numbers
    let teamNo = 0;
    for (const t of teams) {
      debug('assigning team number %s=%s', t._id, teamNo);
      teamNo++;
      const qt: Partial<RegistrationData> = { programId: p._id, teamId: t._id, canceledOn: null };
      await mongoose.connection.db
        .collection('registrations')
        .updateMany(qt, { $set: { teamNo: formatTeamNo(teamNo) } });
    }
  }
}
