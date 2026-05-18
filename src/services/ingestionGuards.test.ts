import { beforeEach, describe, expect, it } from 'vitest';
import {
  getFailedIngestionLogs,
  inspectIngestionCandidate,
  resetFailedIngestionLogs
} from './ingestionGuards';

describe('ingestion guard diagnostics', () => {
  beforeEach(() => {
    resetFailedIngestionLogs();
  });

  it('blocks thin placeholder rows and records failed_ingestion_logs shape', () => {
    const result = inspectIngestionCandidate(
      {
        title: '',
        description: 'Soon',
        imageUrl: '',
        source: 'manual'
      },
      'unknown',
      'https://example.com/bad-row'
    );

    expect(result.event).toBeUndefined();
    expect(result.log?.missingProperties).toEqual(['title', 'description', 'imageUrl']);
    expect(getFailedIngestionLogs()).toHaveLength(1);
  });
});
