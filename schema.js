const joi = require('joi');

const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?v=1";

module.exports.listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        image: joi.object({
            url: joi.string().allow("", null).default(DEFAULT_IMAGE_URL),
            filename: joi.string().allow("", null)
        }).default({ url: DEFAULT_IMAGE_URL }),
        price: joi.number().required().min(0),
        country: joi.string().required(),
        location: joi.string().required()
    }).required()
});

module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required()
    }).required()
});