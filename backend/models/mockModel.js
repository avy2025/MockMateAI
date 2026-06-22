const JsonStore = require('../utils/jsonStore');

class MockModel {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema;
    this.store = new JsonStore(name.toLowerCase() + 's'); // Simple pluralization
    this.methods = {};
    this.hooks = {
      pre: {
        save: []
      }
    };
  }

  pre(hook, fn) {
    if (this.hooks.pre[hook]) {
      this.hooks.pre[hook].push(fn);
    }
  }

  // Mimic Mongoose static methods
  async find(query = {}) {
    const results = await this.store.find(query);
    return results.map(data => this._createInstance(data));
  }

  async findOne(query = {}) {
    const data = await this.store.findOne(query);
    return data ? this._createInstance(data) : null;
  }

  async findById(id) {
    const data = await this.store.findById(id);
    return data ? this._createInstance(data) : null;
  }

  async create(doc) {
    let instanceData = { ...doc };
    
    // Simple mock of pre-save hooks
    const instance = this._createInstance(instanceData);
    for (const hook of this.hooks.pre.save) {
      await new Promise((resolve) => hook.call(instance, resolve));
    }
    
    const data = await this.store.insertOne(instance);
    return this._createInstance(data);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const data = await this.store.updateOne({ _id: id }, update);
    return data ? this._createInstance(data) : null;
  }

  async findOneAndUpdate(query, update, options = {}) {
     const data = await this.store.updateOne(query, update);
     return data ? this._createInstance(data) : null;
  }

  async deleteOne(query) {
    return await this.store.deleteOne(query);
  }

  // For fields like .select('+password') in Mongoose
  // We'll just ignore it for the mock as all fields are always present in JSON
  select(fields) {
    return this; 
  }

  // To support static methods added via schema.statics
  static(name, fn) {
    this[name] = fn.bind(this);
  }

  _createInstance(data) {
    const modelInstance = { ...data };
    const self = this;

    // Add methods to the instance (like .save(), .matchPassword())
    modelInstance.save = async function() {
      // Mock isModified - always returns true for now for simplification
      this.isModified = () => true;

      // Run pre-save hooks
      for (const hook of self.hooks.pre.save) {
        await new Promise((resolve) => hook.call(this, resolve));
      }

      const updatedData = { ...this };
      // Remove mock helpers before saving
      delete updatedData.save;
      delete updatedData.isModified;
      Object.keys(self.methods).forEach(m => delete updatedData[m]);

      await self.store.updateOne({ _id: this._id }, updatedData);
      return this;
    };

    // Add custom methods from schema/model definition
    Object.keys(this.methods).forEach(methodName => {
      modelInstance[methodName] = this.methods[methodName].bind(modelInstance);
    });

    return modelInstance;
  }
}

module.exports = MockModel;
