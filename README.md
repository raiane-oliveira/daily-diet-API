## Requisitos Funcionais

- [x] Deve ser possível criar um usuário
- [x] Deve ser possível editar uma refeição, podendo alterar todos os dados abaixo
- [x] Deve ser possível apagar uma refeição
- [x] Deve ser possível listar todas as refeições de um usuário
- [x] Deve ser possível visualizar uma única refeição
- [x] Deve ser possível recuperar as métricas de um usuário
    - [x] Quantidade total de refeições registradas
    - [x] Quantidade total de refeições dentro da dieta
    - [x] Quantidade total de refeições fora da dieta
    - [x] Melhor sequência de refeições dentro da dieta

## Regras de Negócio

- [x] Deve ser possível identificar o usuário entre as requisições
- [x] Deve ser possível registrar uma refeição feita, com as seguintes informações:
      __As refeições devem ser relacionadas a um usuário__
    - Nome
    - Descrição
    - Data e Hora
    - Está dentro ou não da dieta
- [x] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou