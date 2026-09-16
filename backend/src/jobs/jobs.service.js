const { BadRequestException, ConflictException, NotFoundException } = require('@nestjs/common');
const { JobsRepository } = require('./jobs.repository');

const STATUSES = Object.freeze(['pending', 'running', 'completed', 'failed']);
const TRANSITIONS = Object.freeze({
  pending: ['running', 'failed'],
  running: ['completed'],
  completed: [],
  failed: [],
});

class JobsService {
  constructor() {
    this.repository = new JobsRepository();
  }

  getAll() {
    return this.repository.findAll();
  }

  create(input) {
    const title = typeof input?.title === 'string' ? input.title.trim() : '';
    const type = typeof input?.type === 'string' ? input.type.trim() : '';

    if (!title) {
      throw new BadRequestException('Title is required.');
    }
    if (title.length > 120) {
      throw new BadRequestException('Title must be 120 characters or less.');
    }
    if (!type) {
      throw new BadRequestException('Type is required.');
    }
    if (type.length > 60) {
      throw new BadRequestException('Type must be 60 characters or less.');
    }

    return this.repository.create({ title, type });
  }

  updateStatus(id, nextStatus) {
    const job = this.repository.findById(id);
    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    if (!STATUSES.includes(nextStatus)) {
      throw new BadRequestException(`Invalid status. Allowed values: ${STATUSES.join(', ')}.`);
    }

    if (!TRANSITIONS[job.status].includes(nextStatus)) {
      throw new ConflictException(`Invalid transition: ${job.status} → ${nextStatus}.`);
    }

    // The current status is part of the UPDATE condition. If another request
    // changes the same job first, this request updates zero rows and fails.
    const updatedJob = this.repository.updateStatusIfAllowed(id, job.status, nextStatus);
    if (!updatedJob) {
      throw new ConflictException('Job was changed by another request. Refresh and try again.');
    }

    return updatedJob;
  }

  remove(id) {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Job not found.');
    }
    return { message: 'Job deleted successfully.' };
  }
}

module.exports = { JobsService, STATUSES, TRANSITIONS };
