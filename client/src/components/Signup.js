import React from 'react';
import gql from "graphql-tag";
import { Mutation } from "react-apollo";

const SIGNUP = gql`
    mutation Signup($email: String!, $password: String!) {
        signup(email: $email, password: $password) {
            token
            user
        }
    }
`;

const Signup = () => {
    let email;
    let password;

    return (
        <Mutation mutation={SIGNUP}>
        {(signup, { data }) => ( 
            <div>
                <form onSubmit={e => { 
                    e.preventDefault();
                    signup({ variables: { email: email.value, password: password.value }});
                    email.value = "";
                    password.value = "";
                }}>
                    <input
                        ref = {node => {
                            email = node;
                        }}
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

export default Signup;