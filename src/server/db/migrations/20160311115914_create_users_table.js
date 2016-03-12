
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.increments();
    table.string('linkedin_id').unique();
    table.string('email').unique();
    table.string('preferred_name');
    table.string('last_name');
    table.text('avatar_url');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updtated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
