/* eslint-disable import-helpers/order-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const NodeEnvironment = require('jest-environment-node');
const path = require('path');
const { nanoid } = require('nanoid');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const { PrismaClient } = require('@prisma/client');

const prismaBinary = path.join('node_modules', '.bin', 'prisma');

class PrismaTestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);

    // Generate a unique schema identifier for this test context
    this.schema = `test_${nanoid()}`;

    this.databaseUrl = `postgresql://docker:docker@localhost:25432/start_on_test?schema=${this.schema}`;

    process.env.DATABASE_URL = this.databaseUrl;

    this.global.process.env.DATABASE_URL = this.databaseUrl;
    this.client = new PrismaClient();
  }

  async setup() {
    await this.client.$executeRaw(
      `create schema if not exists "${this.schema}"`
    );

    await exec(`${prismaBinary} db push --preview-feature`);

    return super.setup();
  }

  async teardown() {
    // Drop the schema after the tests have completed
    await this.client.$executeRaw(
      `DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`
    );
    await this.client.$disconnect();
  }
}

module.exports = PrismaTestEnvironment;
