import { S3 } from 'aws-sdk';
import { getServerConfig } from '../../server-config';
import { logger } from '@teams2/logger';

const logLib = logger('aws-s3');

export const s3Client = new S3(getServerConfig().s3);

export async function deleteObjectsPromise(params: S3.DeleteObjectsRequest) {
  return new Promise((resolve, reject) =>
    s3Client.deleteObjects(params, function (err, data) {
      if (err) return reject(err);
      else return resolve(data);
    })
  );
}

export function getLogoFileName() {
  return 'logo';
}

export async function listObjectsV2Promise(
  params: S3.ListObjectsV2Request
): Promise<S3.ListObjectsV2Output> {
  return new Promise((resolve, reject) =>
    s3Client.listObjectsV2(params, function (err, data) {
      if (err) return reject(err);
      else return resolve(data);
    })
  );
}
