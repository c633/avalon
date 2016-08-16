Cloudinary.config({
 cloud_name: Meteor.settings.public.cloudinary.name,
 api_key: process.env.CLOUDINARY_KEY,
 api_secret: process.env.CLOUDINARY_SECRET
});
