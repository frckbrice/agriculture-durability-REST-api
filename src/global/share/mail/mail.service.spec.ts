import { Test, TestingModule } from '@nestjs/testing';
import { MailServiceEvent } from './mail.service';

describe('MailServiceEvent', () => {
  let service: MailServiceEvent;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailServiceEvent],
    }).compile();

    service = module.get<MailServiceEvent>(MailServiceEvent);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});