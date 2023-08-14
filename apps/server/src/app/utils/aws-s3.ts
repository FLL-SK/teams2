import {
  S3Client,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getServerConfig } from '../../server-config';
import { logger } from '@teams2/logger';

const logLib = logger('aws-s3');

const s3Client = createClient();

function createClient() {
  const cfg = getServerConfig().aws;
  return new S3Client({
    region: cfg.region,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
  });
}

export function getLogoFileName() {
  return 'logo';
}

export async function deleteFileFromBucket(fileName: string): Promise<boolean> {
  const log = logLib.extend('deleteFile');

  const params: DeleteObjectCommandInput = {
    Bucket: getServerConfig().aws.s3bucket,
    Key: fileName,
  };

  log.debug('Going to delete file from S3 %o', params);
  const command = new DeleteObjectCommand(params);
  const result = await s3Client.send(command);
  log.debug('Deleted %o', result);
  return result.DeleteMarker === true;
}

export async function getSignedUrlForUpload(fileName: string, fileType: string, expiresIn = 120) {
  const log = logLib.extend('pUrlUp');
  const params: PutObjectCommandInput = {
    Bucket: getServerConfig().aws.s3bucket,
    Key: fileName,
    ContentType: fileType,
  };

  const command = new PutObjectCommand(params);

  const url = getSignedUrl(s3Client, command, { expiresIn });

  log.debug('Pre-signed url created. Blob id=%s ContentType=%s url=%s', fileName, fileType, url);
  return url;
}

export async function getSignedUrlForDownload(fileName: string, fileType: string, expiresIn = 900) {
  const log = logLib.extend('pUrlDown');
  const params: GetObjectCommandInput = {
    Bucket: getServerConfig().aws.s3bucket,
    Key: fileName,
  };
  const command = new GetObjectCommand(params);

  const url = await getSignedUrl(s3Client, command, { expiresIn });

  log.debug('Pre-signed url created. Blob id=%s ContentType=%s url=%s', fileName, fileType, url);
  return url;
}
