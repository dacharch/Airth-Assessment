const {
  BadRequestException,
  ConflictException,
  NotFoundException,
} = require('@nestjs/common');
const { JobsRepository } = require('./jobs.repository');

const STATUSES = Object.freeze([
  'pending',
  'running',
  'completed',
  'failed',
]);

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

  async getAll() {
    return this.repository.findAll();
  }

  async create(input) {
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

  async updateStatus(id, nextStatus) {
    if (!STATUSES.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid status. Allowed values: ${STATUSES.join(', ')}.`,
      );
    }

    const job = await this.repository.findById(id);

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    if (!TRANSITIONS[job.status].includes(nextStatus)) {
      throw new ConflictException(
        `Invalid transition: ${job.status} → ${nextStatus}.`,
      );
    }

    // The current status is part of the UPDATE condition.
    // If another request changes the job first, this request updates zero rows.
    const updatedJob = await this.repository.updateStatusIfAllowed(
      id,
      job.status,
      nextStatus,
    );

    if (!updatedJob) {
      throw new ConflictException(
        'Job was changed by another request. Refresh and try again.',
      );
    }

    return updatedJob;
  }

  async remove(id) {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Job not found.');
    }

    return { message: 'Job deleted successfully.' };
  }
}

module.exports = { JobsService, STATUSES, TRANSITIONS };
