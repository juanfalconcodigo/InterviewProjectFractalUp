import { gql } from "apollo-angular";
const GET_COUNTRIES = gql`
query getCountry($filter:CountryFilterInput){
    countries(filter:$filter) {
      code
      name
      continent {
        code
        name
      }
      capital
      languages {
        name
      }
      currencies
      states {
        name
      }
    }
  }
`;

export {
  GET_COUNTRIES
}