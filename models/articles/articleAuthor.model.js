import mongoose, {Schema} from 'mongoose';

const ArticleAuthorSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.hasAccount === true;
    }
  },
  hasAccount: {
    type: Boolean,
    default: false
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng nhập email hợp lệ']
  },
  institution: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  isCorresponding: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  },
  orcid: {
    type: String,
    trim: true
  }
}, { _id: true });

export const ArticleAuthor = mongoose.model('ArticleAuthor', ArticleAuthorSchema);