import React from "react";
import {fireEvent, queryByTestId, queryByText, render, waitFor} from "@testing-library/react";
import {MemoryRouter} from 'react-router-dom';
import App from './App';
import {Provider} from "react-redux";
import axios from "axios";
import configureStore from "../redux/configureStore";
import * as apiCalls from '../api/apiCalls';

apiCalls.listUsers = jest.fn().mockResolvedValue({
    data: {
        content: [],
        number: 0,
        size: 3
    }
});

beforeEach(() => {
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
});

const setup = (path) => {
    return render(
        <Provider store={configureStore(false)}>
            <MemoryRouter initialEntries={[path]}>
                <App/>
            </MemoryRouter>
        </Provider>
    );
}

const changeEvent = (content) => {
    return {
        target: {
            value: content
        }
    }
};

describe('App', () => {

    it('displays homepage when url is /', () => {
        const {queryByTestId} = setup('/');
        expect(queryByTestId('homepage')).toBeInTheDocument();
    });

    it('displays loginPage when url is /login', () => {
        const {container} = setup('/login');
        const header = container.querySelector('h1');
        expect(header).toHaveTextContent('Login');
    });

    it('displays only loginPage when url is /login', () => {
        const {queryByTestId} = setup('/login');
        expect(queryByTestId('homepage')).not.toBeInTheDocument();
    });

    it('displays UserSignupPage when url is /signup', () => {
        const {container} = setup('/signup');
        const header = container.querySelector('h1');
        expect(header).toHaveTextContent('Sign Up');
    });

    it('displays homepage when url is not / or /login or /signup', () => {
        const {queryByTestId} = setup('/user1');
        expect(queryByTestId('userpage')).toBeInTheDocument();
    });

    it('displays topbar when url is /', () => {
        const {container} = setup('/');
        const navigation = container.querySelector('nav');
        expect(navigation).toBeInTheDocument();
    });

    it('displays topbar when url is /signup', () => {
        const {container} = setup('/signup');
        const navigation = container.querySelector('nav');
        expect(navigation).toBeInTheDocument();
    });

    it('displays topbar when url is /login', () => {
        const {container} = setup('/login');
        const navigation = container.querySelector('nav');
        expect(navigation).toBeInTheDocument();
    });

    it('displays topbar when url is /user1', () => {
        const {container} = setup('/user1');
        const navigation = container.querySelector('nav');
        expect(navigation).toBeInTheDocument();
    });

    it('shows UserSignupPage when clicking signup', () => {
        const {queryByText, container} = setup('/');
        const signUpLink = queryByText('Sign Up');
        fireEvent.click(signUpLink);
        const header = container.querySelector('h1');
        expect(header).toHaveTextContent('Sign Up');
    });

    it('shows LoginPage when clicking login', () => {
        const {queryByText, container} = setup('/');
        const loginLink = queryByText('Login');
        fireEvent.click(loginLink);
        const header = container.querySelector('h1');
        expect(header).toHaveTextContent('Login');
    });


    it('shows homepage when clicking the logo', () => {
        const {queryByTestId, container} = setup('/');
        const logo = container.querySelector('img');
        fireEvent.click(logo);
        const header = queryByTestId('homepage');
        expect(header).toBeInTheDocument();
    });

    it('displays My Profile on top bar after login success', async () => {
        const {queryByPlaceholderText, container, queryByText} = setup('/login');
        const usernameInput = queryByPlaceholderText('Your username');
        fireEvent.change(usernameInput, changeEvent('user1'));
        const passwordInput = queryByPlaceholderText('Your password');
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        const button = container.querySelector("button");
        axios.post = jest.fn().mockResolvedValue({
            data: {
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile1.png'
            }
        });
        fireEvent.click(button);
        await waitFor(() => {
            const myProfileLink = queryByText('My Profile');
            expect(myProfileLink).toBeInTheDocument();
        })
    });

    it('displays My Profile en top bar after signup success', async () => {
        const {queryByPlaceholderText, container, queryByText} = setup('/signup');
        const displayNameInput = queryByPlaceholderText('Your display name');
        const usernameInput = queryByPlaceholderText('Your username');
        const passwordInput = queryByPlaceholderText('Your password');
        const passwordRepeatInput = queryByPlaceholderText('Repeat your password');

        fireEvent.change(displayNameInput, changeEvent('display1'));
        fireEvent.change(usernameInput, changeEvent('user1'));
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        fireEvent.change(passwordRepeatInput, changeEvent('P4ssword'));

        const button = container.querySelector('button');
        axios.post = jest.fn().mockResolvedValueOnce({
            data: {
                message: 'User saved'
            }
        }).mockResolvedValueOnce({
            data: {
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile1.png'
            }
        });

        fireEvent.click(button);
        await waitFor(() => {
            const myProfileLink = queryByText('My Profile');
            expect(myProfileLink).toBeInTheDocument();
        });
    });

    it('saves logged in user in local storage after login success', async () => {
        const {queryByPlaceholderText, container, queryByText} = setup('/signup');
        const displayNameInput = queryByPlaceholderText('Your display name');
        const usernameInput = queryByPlaceholderText('Your username');
        const passwordInput = queryByPlaceholderText('Your password');
        const passwordRepeatInput = queryByPlaceholderText('Repeat your password');

        fireEvent.change(displayNameInput, changeEvent('display1'));
        fireEvent.change(usernameInput, changeEvent('user1'));
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        fireEvent.change(passwordRepeatInput, changeEvent('P4ssword'));

        const button = container.querySelector('button');
        axios.post = jest.fn().mockResolvedValueOnce({
            data: {
                message: 'User saved'
            }
        }).mockResolvedValueOnce({
            data: {
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile1.png'
            }
        });

        fireEvent.click(button);
        await waitFor(() => {
            const dataInStorage = JSON.parse(localStorage.getItem('hoax-auth'));
            expect(dataInStorage).toEqual({
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile1.png',
                password: 'P4ssword',
                isLoggedIn: true
            })
        });
    });


    it('displays topbar when storage has logged in user data', async () => {
        localStorage.setItem('hoax-auth', JSON.stringify({
            id: 1,
            username: 'user1',
            displayName: 'display1',
            image: 'profile1.png',
            password: 'P4ssword',
            isLoggedIn: true
        }));
        const { queryByText } = setup('/');
        const myProfileLink = queryByText('My Profile');
        expect(myProfileLink).toBeInTheDocument();
    });


    it('sets axios authorization with base64 encoded user credentials after login success', async () => {
        const {queryByPlaceholderText, container, queryByText} = setup('/signup');
        const displayNameInput = queryByPlaceholderText('Your display name');
        const usernameInput = queryByPlaceholderText('Your username');
        const passwordInput = queryByPlaceholderText('Your password');
        const passwordRepeatInput = queryByPlaceholderText('Repeat your password');

        fireEvent.change(displayNameInput, changeEvent('display1'));
        fireEvent.change(usernameInput, changeEvent('user1'));
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        fireEvent.change(passwordRepeatInput, changeEvent('P4ssword'));

        const button = container.querySelector('button');
        axios.post = jest.fn().mockResolvedValueOnce({
            data: {
                message: 'User saved'
            }
        }).mockResolvedValueOnce({
            data: {
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile1.png'
            }
        });

        fireEvent.click(button);
        await waitFor(() => {
            const axiosAuthorization = axios.defaults.headers.common['Authorization'];
            const encoded = btoa('user1:P4ssword');
            const expectedAuthorization = `Basic ${encoded}`;
            expect(axiosAuthorization).toBe(expectedAuthorization);
        });
    });

    it('sets axios authorization with base64 encoded user credentials when storage has logged in user data', async () => {
        localStorage.setItem('hoax-auth', JSON.stringify({
            id: 1,
            username: 'user1',
            displayName: 'display1',
            image: 'profile1.png',
            password: 'P4ssword',
            isLoggedIn: true
        }));
        setup('/');
        const axiosAuthorization = axios.defaults.headers.common['Authorization'];
        const encoded = btoa('user1:P4ssword');
        const expectedAuthorization = `Basic ${encoded}`;
        expect(axiosAuthorization).toBe(expectedAuthorization);
    });

    it('removes axios authorization header when user logs out', async () => {
        localStorage.setItem('hoax-auth', JSON.stringify({
            id: 1,
            username: 'user1',
            displayName: 'display1',
            image: 'profile1.png',
            password: 'P4ssword',
            isLoggedIn: true
        }));
        const {queryByText} = setup('/');
        fireEvent.click(queryByText('Logout'));
        const axiosAuthorization = axios.defaults.headers.common['Authorization'];
        expect(axiosAuthorization).toBeFalsy();
    });

});

console.error = () => {};