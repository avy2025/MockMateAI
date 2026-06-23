const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const logger = require('./logger');

class JsonStore {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.basePath = path.join(__dirname, '..', 'data', 'local');
    this.filePath = path.join(this.basePath, `${collectionName}.json`);
    this.data = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      await fs.mkdir(this.basePath, { recursive: true });
      const fileExists = await fs.access(this.filePath).then(() => true).catch(() => false);
      
      if (fileExists) {
        const content = await fs.readFile(this.filePath, 'utf-8');
        this.data = JSON.parse(content);
      } else {
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
        this.data = [];
      }
      this.initialized = true;
    } catch (error) {
      logger.error({ msg: `Error initializing JsonStore for ${this.collectionName}`, error });
      this.data = [];
    }
  }

  async save() {
    await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
  }

  async find(query = {}) {
    await this.init();
    return this.data.filter(item => {
      return Object.keys(query).every(key => {
        if (key === '_id' && query[key]) return String(item._id) === String(query[key]);
        return item[key] === query[key];
      });
    });
  }

  async findOne(query = {}) {
    await this.init();
    return this.data.find(item => {
      return Object.keys(query).every(key => {
        if (key === '_id' && query[key]) return String(item._id) === String(query[key]);
        return item[key] === query[key];
      });
    }) || null;
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async insertOne(doc) {
    await this.init();
    const newDoc = {
      _id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    this.data.push(newDoc);
    await this.save();
    return newDoc;
  }

  async updateOne(query, update) {
    await this.init();
    const index = this.data.findIndex(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });

    if (index !== -1) {
      this.data[index] = {
        ...this.data[index],
        ...update,
        updatedAt: new Date().toISOString()
      };
      await this.save();
      return this.data[index];
    }
    return null;
  }

  async deleteOne(query) {
    await this.init();
    const initialLength = this.data.length;
    this.data = this.data.filter(item => {
      return !Object.keys(query).every(key => item[key] === query[key]);
    });
    
    if (this.data.length !== initialLength) {
      await this.save();
      return true;
    }
    return false;
  }
}

module.exports = JsonStore;
