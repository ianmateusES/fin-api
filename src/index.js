const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

function verifyIfExistsAccountCPF(req, res, next) {
  const { cpf } = req.headers;

  const customer = customers.find(
    (customer) => customer.cpf === cpf
  );

  if (!customer) {
    return res.status(400).json({ error: 'Customer not found' });
  }

  req.customer = customer;

  return next();
}

function getBalance(statements) {
  const balance = statements.reduce((acc, statement) => {
    if (statement.type === 'credit') {
      return acc + statement.amount;
    } else if (statement.type === 'debit') {
      return acc - statement.amount;
    }
  }, 0);

  return balance;
}

app.post('/accounts', (req, res) => {
  const { cpf, name } = req.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return res.status(400).json({ error: 'Customer already exists!' });
  }

  const customer = {
    id: uuidv4(),
    cpf,
    name,
    statements: [],
  };

  customers.push(customer);

  return res.json(customer)
});

app.use(verifyIfExistsAccountCPF)

app.get('/statements', (req, res) => {
  const { customer } = req;

  return res.json(customer.statements);
});

app.post('/deposits', (req, res) => {
  const { customer } = req;
  const { description, amount } = req.body;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit'
  };

  customer.statements.push(statementOperation);

  return res.status(201).json(statementOperation);
});

app.post('/withdraws', (req, res) => {
  const { customer } = req;
  const { amount } = req.body;

  const balance = getBalance(customer.statements);

  if(balance < amount) {
    return res.status(400).json({ error: 'Insufficient founds!' });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit'
  };

  customer.statements.push(statementOperation);

  return res.json(statementOperation);
});

app.get('/statements/date', (req, res) => {
  const { customer } = req;
  const { day, month, year } = req.query;

  const date = new Date(year, month - 1, day, 0);

  const statement = customer.statements.filter(
    (statement) => statement.created_at.toDateString() === date.toDateString()
  );

  return res.json(statement);
});

app.listen(3333);
