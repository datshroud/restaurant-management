import { Test, TestingModule } from '@nestjs/testing';
import { TablesService } from './tables.service';
import { DATABASE_POOL } from '../db/db.module';

describe('TablesService', () => {
  let service: TablesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TablesService,
        {
          provide: DATABASE_POOL,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TablesService>(TablesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
