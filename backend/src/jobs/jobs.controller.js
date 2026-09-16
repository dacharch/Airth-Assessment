const { Controller, Delete, Get, Param, Patch, Post, Body, ParseIntPipe, Inject } = require('@nestjs/common');
const { JobsService } = require('./jobs.service');

class JobsController {
  constructor(service) {
    this.service = service;
  }

  getJobs() {
    return this.service.getAll();
  }

  createJob(body) {
    return this.service.create(body);
  }

  updateJobStatus(id, body) {
    return this.service.updateStatus(id, body?.status);
  }

  deleteJob(id) {
    return this.service.remove(id);
  }
}

// JavaScript version of Nest decorators: no TypeScript is used anywhere.
Controller('jobs')(JobsController);
Inject(JobsService)(JobsController, undefined, 0);
Get()(JobsController.prototype, 'getJobs', Object.getOwnPropertyDescriptor(JobsController.prototype, 'getJobs'));
Post()(JobsController.prototype, 'createJob', Object.getOwnPropertyDescriptor(JobsController.prototype, 'createJob'));
Patch(':id/status')(JobsController.prototype, 'updateJobStatus', Object.getOwnPropertyDescriptor(JobsController.prototype, 'updateJobStatus'));
Delete(':id')(JobsController.prototype, 'deleteJob', Object.getOwnPropertyDescriptor(JobsController.prototype, 'deleteJob'));

Param('id', ParseIntPipe)(JobsController.prototype, 'updateJobStatus', 0);
Body()(JobsController.prototype, 'updateJobStatus', 1);
Body()(JobsController.prototype, 'createJob', 0);
Param('id', ParseIntPipe)(JobsController.prototype, 'deleteJob', 0);

module.exports = { JobsController };
