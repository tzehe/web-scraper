import mongoose from 'mongoose';

const { Schema } = mongoose;

// schema
const wordFreqSchema = new Schema({ word: String, frequency: Number });
const mongoSchema = new Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  data: {
    type: [wordFreqSchema],
    required: true,
  },
});

class ResultClass {
  static async getFromCache(url) {
    const result = await this.findOne({ url: url });
    if (result) {
      return result.data;
    }

    return false;
  }
  static async writeToCache({ url, data }) {
    const newResult = await this.create({
      createdAt: new Date(),
      url,
      data,
    });
    return newResult;
  }
}

mongoSchema.loadClass(ResultClass);

// model
const Result = mongoose.model('Result', mongoSchema);

export default Result;
