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
      hello: string;
      me: IUser | null;
   }

   interface IHelloOnQueryArguments {
      name?: string | null;
   }

   interface IUser {
      __typename: 'User';
      id: string;
      email: string;
   }

   interface IMutation {
      __typename: 'Mutation';
      sendForgotPasswordEmail: boolean | null;
      forgotPasswordChange: IError[] | null;
      login: IError[] | null;
      logout: boolean | null;
      register: IError[] | null;
   }

   interface ISendForgotPasswordEmailOnMutationArguments {
      email: string;
   }

   interface IForgotPasswordChangeOnMutationArguments {
      newPassword: string;
      key: string;
   }

   interface ILoginOnMutationArguments {
      email: string;
      password: string;
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
