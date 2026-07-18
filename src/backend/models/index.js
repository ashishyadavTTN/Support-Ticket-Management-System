const User = require('./User');
const Ticket = require('./Ticket');
const Comment = require('./Comment');

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

module.exports = {
  User,
  Ticket,
  Comment,
};
