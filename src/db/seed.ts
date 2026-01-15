import { Task } from '../tasks/task.entity';
import dataSource from './data-source';

async function seed() {
  await dataSource.initialize();

  const repo = dataSource.getRepository(Task);

  const count = await repo.count();
  if (count === 0) {
    await repo.save([
      repo.create({
        title: 'Seed task 1',
        completed: false,
        ownerId: '11111111-1111-1111-1111-111111111111',
      }),
      repo.create({
        title: 'Seed task 2',
        completed: true,
        ownerId: '22222222-2222-2222-2222-222222222222',
      }),
    ]);
  }

  await dataSource.destroy();
}

seed().catch((e) => {
  console.log(e);
  process.exit(1);
});
