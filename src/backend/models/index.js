const User = require('./User');
const Ticket = require('./Ticket');
const Comment = require('./Comment');
const Attachment = require('./Attachment');

// User <-> Ticket associations
User.hasMany(Ticket, { foreignKey: 'createdBy', as: 'createdTickets' });
User.hasMany(Ticket, { foreignKey: 'assignedTo', as: 'assignedTickets' });
Ticket.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Ticket.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

// Ticket <-> Comment associations
Ticket.hasMany(Comment, { foreignKey: 'ticketId', as: 'comments' });
Comment.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

// User <-> Comment associations
User.hasMany(Comment, { foreignKey: 'createdBy', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'createdBy', as: 'author' });

// Ticket / Comment <-> Attachment associations
Ticket.hasMany(Attachment, { foreignKey: 'ticketId', as: 'attachments' });
Attachment.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });
Comment.hasMany(Attachment, { foreignKey: 'commentId', as: 'attachments' });
Attachment.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });
User.hasMany(Attachment, { foreignKey: 'uploadedBy', as: 'uploadedAttachments' });
Attachment.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

module.exports = {
  User,
  Ticket,
  Comment,
  Attachment,
};
