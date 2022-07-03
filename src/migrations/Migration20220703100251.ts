import { Migration } from '@mikro-orm/migrations';

export class Migration20220703100251 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null);');

    this.addSql('drop table if exists "mikro_orm_migrations" cascade;');
  }

  async down(): Promise<void> {
    this.addSql('create table "mikro_orm_migrations" ("id" serial primary key, "name" varchar null default null, "executed_at" timestamptz null default CURRENT_TIMESTAMP);');

    this.addSql('drop table if exists "post" cascade;');
  }

}
