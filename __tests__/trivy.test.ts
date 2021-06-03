import * as path from 'path';
import { Downloader } from '../src/downloader';
import { scan } from '../src/trivy';
import { TrivyOption } from '../src/interface';
import { removeTrivyCmd } from './helper';

const downloader = new Downloader();
const template = path.join(__dirname, '../src/template/default.tpl');

describe('Trivy scan', () => {
  let trivyPath: string;
  const image = 'knqyf263/vuln-image';

  beforeAll(async () => {
    trivyPath = !downloader.trivyExists(__dirname)
      ? await downloader.download('latest', __dirname)
      : `${__dirname}/trivy`;
  }, 300000);

  afterAll(() => {
    removeTrivyCmd(trivyPath);
  });

  test('with valid option', () => {
    const option: TrivyOption = {
      severity: 'HIGH,CRITICAL',
      vulnType: 'os,library',
      ignoreUnfixed: true,
      template
    };
    const result = scan(trivyPath, image, option) as string;
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test('without ignoreUnfixed', () => {
    const option: TrivyOption = {
      severity: 'HIGH,CRITICAL',
      vulnType: 'os,library',
      ignoreUnfixed: false,
      template
    };
    const result: string = scan(trivyPath, image, option) as string;
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test('with invalid severity', () => {
    const invalidOption: TrivyOption = {
      severity: 'INVALID',
      vulnType: 'os,library',
      ignoreUnfixed: true,
      template
    };
    expect(() => {
      scan(trivyPath, image, invalidOption);
    }).toThrowError('Trivy option error: INVALID is unknown severity');
  });

  test('with invalid vulnType', () => {
    const invalidOption: TrivyOption = {
      severity: 'HIGH',
      vulnType: 'INVALID',
      ignoreUnfixed: true,
      template
    };
    expect(() => {
      scan(trivyPath, image, invalidOption);
    }).toThrowError('Trivy option error: INVALID is unknown vuln-type');
  });
});
