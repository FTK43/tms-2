import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasks1762796846030 implements MigrationInterface {
  name = 'CreateTasks1762796846030';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "completed" boolean NOT NULL DEFAULT false, "ownerId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_607de52438268ab19a40634942" ON "tasks" ("ownerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bc913ba3ebec322f9f278ccf10" ON "tasks" ("ownerId", "completed") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bc913ba3ebec322f9f278ccf10"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_607de52438268ab19a40634942"`,
    );
    await queryRunner.query(`DROP TABLE "tasks"`);
  }
}
