Meteor.users.helpers({
  getAvatarSrc() {
    return this.brief.avatarVersion ? $.cloudinary.url(this._id, { version: this.brief.avatarVersion }) : '/images/avatar.png';
  }
});
