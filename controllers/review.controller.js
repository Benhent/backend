import Review from '../models/articles/review.model.js';
import Article from '../models/articles/article.model.js';
import User from '../models/users/user.model.js';
// import { sendEmail } from '../mail/emailService.js';

export const createReview = async (req, res) => {
  try {
    const { articleId, reviewerId, responseDeadline, reviewDeadline } = req.body;

    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if reviewer exists
    const reviewer = await User.findById(reviewerId);
    if (!reviewer) {
      return res.status(404).json({
        success: false,
        message: 'Reviewer not found'
      });
    }

    // Check if reviewer is already invited for this article
    const existingReview = await Review.findOne({ articleId, reviewerId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Reviewer is already invited for this article'
      });
    }

    // Create new review invitation
    const review = new Review({
      articleId,
      reviewerId,
      responseDeadline,
      reviewDeadline
    });

    await review.save();

    // Send email notification to reviewer
    // TODO: Implement email notification

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error("Error in createReview:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating review"
    });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const { articleId, reviewerId, status } = req.query;
    const filter = {};

    if (articleId) filter.articleId = articleId;
    if (reviewerId) filter.reviewerId = reviewerId;
    if (status) filter.status = status;

    const reviews = await Review.find(filter)
      .populate('articleId', 'title')
      .populate('reviewerId', 'name email');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error("Error in getAllReviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reviews"
    });
  }
};

export const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('articleId', 'title')
      .populate('reviewerId', 'name email');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error("Error in getReview:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching review"
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user has permission to update this review
    // TODO: Implement permission check

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedReview
    });
  } catch (error) {
    console.error("Error in updateReview:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating review"
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error("Error in deleteReview:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting review"
    });
  }
};

export const acceptReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the reviewer
    if (review.reviewerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this review'
      });
    }

    // Check if review is still in invited status
    if (review.status !== 'invited') {
      return res.status(400).json({
        success: false,
        message: 'Review invitation has already been responded to'
      });
    }

    await review.accept();

    // Send email notification to editor
    // TODO: Implement email notification

    res.status(200).json({
      success: true,
      message: 'Review accepted successfully',
      data: review
    });
  } catch (error) {
    console.error("Error in acceptReview:", error);
    res.status(500).json({
      success: false,
      message: "Server error while accepting review"
    });
  }
};

export const declineReview = async (req, res) => {
  try {
    const { declineReason } = req.body;
    
    if (!declineReason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for declining the review'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the reviewer
    if (review.reviewerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to decline this review'
      });
    }

    // Check if review is still in invited status
    if (review.status !== 'invited') {
      return res.status(400).json({
        success: false,
        message: 'Review invitation has already been responded to'
      });
    }

    await review.decline(declineReason);

    // Send email notification to editor
    // TODO: Implement email notification

    res.status(200).json({
      success: true,
      message: 'Review declined successfully',
      data: review
    });
  } catch (error) {
    console.error("Error in declineReview:", error);
    res.status(500).json({
      success: false,
      message: "Server error while declining review"
    });
  }
};

export const completeReview = async (req, res) => {
  try {
    const { recommendation, commentsForAuthor, commentsForEditor } = req.body;

    if (!recommendation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a recommendation'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the reviewer
    if (review.reviewerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this review'
      });
    }

    // Check if review is in accepted status
    if (review.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Review must be accepted before it can be completed'
      });
    }

    await review.complete(recommendation, commentsForAuthor, commentsForEditor);

    // Send email notification to editor
    // TODO: Implement email notification

    res.status(200).json({
      success: true,
      message: 'Review completed successfully',
      data: review
    });
  } catch (error) {
    console.error("Error in completeReview:", error);
    res.status(500).json({
      success: false,
      message: "Server error while completing review"
    });
  }
};

export const sendReminder = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if review is in invited or accepted status
    if (review.status !== 'invited' && review.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Reminder can only be sent for invited or accepted reviews'
      });
    }

    await review.sendReminder();

    // Send email reminder to reviewer
    // TODO: Implement email notification

    res.status(200).json({
      success: true,
      message: 'Reminder sent successfully',
      data: review
    });
  } catch (error) {
    console.error("Error in sendReminder:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending reminder"
    });
  }
}; 