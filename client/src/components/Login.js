import React from 'react';
import { Mutation } from "react-apollo";
import gql from "graphql-tag";

const LOGIN = gql`
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
            user
        }
    }
`;

const Login = () => {
    let email;
    let password;

    return (
        <Mutation mutation={LOGIN}>
        {(login, { data }) => ( 
            <div>
                <form onSubmit={e => { 
                    e.preventDefault();
                    login({ variables: { email: email.value, password: password.value }});
                    email.value = "";
                    password.value = "";
                }}>
                    <input
                        ref = {
                            node => {
                            console.log(node)
                            email = node;
                        }
                    }
                        type="email"
                        placeholder="Email"
                        name="email"
                        // onChange={this.handleInputChange}
                        // value={this.state.email}
                    />
                    <input
                        ref = {node => {
                            password = node;
                        }}
                        type="password"
                        placeholder="Password"
                        name="password"
//                        onChange={this.handleInputChange}
 //                       value={this.state.password}
                    />
                    <button
                        type="submit"
                    >
                        Login User
                    </button>
                </form>
            </div>
        )}
        </Mutation>
    )
}

export default Login;