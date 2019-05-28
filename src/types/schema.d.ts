// tslint:disable
// graphql typescript definitions

export namespace GQL {
   interface IGraphQLResponseRoot {
      data?: IQuery | IMutation;
      errors?: IGraphQLResponseError[];
   }

   interface IGraphQLResponseError {
      /** Required for all errors */
      message: string;
      locations?: IGraphQLResponseErrorLocation[];
      /** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
      [propName: string]: any;
   }

   interface IGraphQLResponseErrorLocation {
      line: number;
      column: number;
   }

   interface IQuery {
      __typename: 'Query';
      bye: string | null;
      hello: string;
   }

   interface IHelloOnQueryArguments {
      name?: string | null;
   }

   interface IMutation {
      __typename: 'Mutation';
      register: (IError | null)[] | null;
   }

   interface IRegisterOnMutationArguments {
      email: string;
      password: string;
   }

   interface IError {
      __typename: 'Error';
      path: string;
      message: string;
   }
}

// tslint:enable
