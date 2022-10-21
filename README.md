## eCommerece APi

## Description

Online shop API with the following features:
- Product API:
  - API to list all the products with
  - search: by title and description
  - sort: by price

- Checkout API:
  - API to create an order
    - API to view single order
  - API to add product in order
  - API to update/delete product in order
  - API to purchase order
  - API to pay order

### Built With

- [Nest.js](https://nestjs.com/)
- [Prisma](https://prisma.io/)


<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running, please follow these simple steps.

### Prerequisites

Here is what you need to be able to run Cal.

- Node.js (Version: >=16.x <17)
- PostgreSQL
- Yarn _(recommended)_

## Development

### Setup

1. Clone the repo into a public GitHub repository (or fork https://github.com/calcom/cal.com/fork). If you plan to distribute the code, keep the source code public to comply with [AGPLv3](https://github.com/calcom/cal.com/blob/main/LICENSE). To clone in a private repository, [acquire a commercial license](https://cal.com/sales))

   ```sh
   git clone https://github.com/mabc224/myos-test.git
   ```

2. Go to the project folder

   ```sh
   cd myos-test
   ```

3. Install packages with yarn

   ```sh
   yarn
   ```

4. Set up your .env file
    
   ```sh
    Duplicate `.env.example` to `.env`
   
    Configure environment variables in the `.env` file.
   ```

5. Run migration

   ```sh
    yarn migrate:dev
   ```
6. Run 

    ```bash
    # development
    $ yarn start
    
    # watch mode
    $ yarn start:dev
    ```

## API Documentation

Import open api docs into postman as collection.

```shell
  docs/api-v1.yaml
```

## Stay in touch

- Author - [Arsalan Bilal](https://www.linkedin.com/in/charsalanbilal)

## License

This app is [MIT licensed](LICENSE).
