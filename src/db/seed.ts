import { Task } from '../tasks/task.entity';
import dataSource from './data-source';

async function seed() {
  await dataSource.initialize();

  const repo = dataSource.getRepository(Task);

  const count = await repo.count();
  if (count === 0) {
    await repo.save([
      repo.create({ title: 'seed task 1', ownerId: 'u1', completed: false }),
      repo.create({ title: 'seed task 2', ownerId: 'u2', completed: true }),
    ]);
  }

  await dataSource.destroy();
}

seed().catch((e) => {
  console.log(e);
  process.exit(1);
});
