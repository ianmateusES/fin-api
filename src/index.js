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
    statement: [],
  };

  customers.push(customer);

  return res.json(customer)
});

app.use(verifyIfExistsAccountCPF)

app.get('/statements', (req, res) => {
  const { customer } = req;

  return res.json(customer.statement);
});

app.post('/deposits', (req, res) => {
  const { customer } = req;
  const { description, amount } = req.body;

  const statementOperation = {
    description,
    amount,
    crated_at: new Date(),
    type: "credit"
  };

  customer.statement.push(statementOperation);

  return res.status(201).json(statementOperation);
})

app.listen(3333);
