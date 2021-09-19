import React from "react";
import {fireEvent, render, waitFor, waitForElement} from "@testing-library/react";
import UserList from './UserList';
import * as apiCalls from '../api/apiCalls';
import {MemoryRouter} from 'react-router-dom';


apiCalls.listUsers = jest.fn().mockResolvedValue({
    data: {
        content: [],
        number: 0,
        size: 3
    }
});

const setup = () => {
    return render(<MemoryRouter>
        <UserList/>
    </MemoryRouter>);
};

const mockedEmptySuccessResponse = {
    data: {
        content: [],
        number: 0,
        size: 3
    }
};

const mockSuccessGetSinglePage = {
    data: {
        content: [
            {
                username: 'user1',
                displayName: 'display1',
                image: ''
            },
            {
                username: 'user2',
                displayName: 'display2',
                image: ''
            },
            {
                username: 'user3',
                displayName: 'display3',
                image: ''
            },
        ],
        number: 0,
        first: true,
        last: true,
        size: 3,
        totalPages: 1
    }
}

const mockSuccessGetMultiPageFirst = {
    data: {
        content: [
            {
                username: 'user1',
                displayName: 'display1',
                image: ''
            },
            {
                username: 'user2',
                displayName: 'display2',
                image: ''
            },
            {
                username: 'user3',
                displayName: 'display3',
                image: ''
            },
        ],
        number: 0,
        first: true,
        last: false,
        size: 3,
        totalPages: 2
    }
};


const mockSuccessGetMultiPageLast = {
    data: {
        content: [
            {
                username: 'user4',
                displayName: 'display4',
                image: ''
            }
        ],
        number: 1,
        first: false,
        last: true,
        size: 3,
        totalPages: 2
    }
}


const mockFailGet = {
    response: {
        data: {
            message: 'Load error'
        }
    }
}

describe('UserList', () => {
    describe('Layout', () => {

        it('has header of Users', () => {
            const {container} = setup();
            const header = container.querySelector('h3');
            expect(header).toHaveTextContent("Users");
        });

        it('displays 3 items when listUser api returns 3 users', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetSinglePage);
            const {queryByTestId} = setup();
            await waitFor(() => {
                const userGroup = queryByTestId('usergroup');
                expect(userGroup.childElementCount).toBe(3);
            });
        });

        it('displays the displayName@username when listUser api returns users', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetSinglePage);
            const {queryByText} = setup();
            await waitFor(() => {
                const firstUser = queryByText('display1@user1');
                expect(firstUser).toBeInTheDocument();
            });
        });

        it('displays the next button when response has last value as false', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetMultiPageFirst);
            const {queryByText} = setup();
            await waitFor(() => {
                const nextLink = queryByText('next >');
                expect(nextLink).toBeInTheDocument();
            });
        });

        it('hides the next button when response has last value as true', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetMultiPageLast);
            const {queryByText} = setup();
            await waitFor(() => {
                const nextLink = queryByText('next >');
                expect(nextLink).not.toBeInTheDocument();
            });
        });

        it('displays the previous when response has first value as false', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetMultiPageLast);
            const {queryByText} = setup();
            await waitFor(() => {
                const previousLink = queryByText('< previous');
                expect(previousLink).toBeInTheDocument();
            });
        });

        it('hides the previous when response has first value as true', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetMultiPageFirst);
            const {queryByText} = setup();
            await waitFor(() => {
                const previousLink = queryByText('< previous');
                expect(previousLink).not.toBeInTheDocument();
            });
        });


        it('has link to UserPage', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetSinglePage);
            const {queryByText, container} = setup();
            await waitFor(() => {
                const firstAnchor = container.querySelectorAll('a')[0];
                expect(firstAnchor.getAttribute("href")).toBe('/user1');
            });
        });
    });


    describe('Lifecycle', () => {

        it('calls listUsers api when it is rendered', () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockedEmptySuccessResponse);
            setup();
            expect(apiCalls.listUsers).toHaveBeenCalledTimes(1);
        });

        it('calls listUsers method with page zero and size three', () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockedEmptySuccessResponse);
            setup();
            expect(apiCalls.listUsers).toHaveBeenCalledWith({page: 0, size: 3});
        });

    });

    describe('Interactions', function () {
        it('loads next page when clicked to next button', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValueOnce(mockSuccessGetMultiPageFirst).mockResolvedValueOnce(mockSuccessGetMultiPageLast);
            const {queryByText} = setup();
            await waitFor(async () => {
                const nextLink = queryByText('next >');
                fireEvent.click(nextLink);

                await waitFor(() => {
                    const secondPageUser = queryByText('display4@user4');
                    expect(secondPageUser).toBeInTheDocument();
                })

            });
        });

        it('loads previous page when clicked to previous button', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValueOnce(mockSuccessGetMultiPageLast).mockResolvedValueOnce(mockSuccessGetMultiPageFirst);
            const {queryByText} = setup();
            await waitFor(async () => {
                const previousLink = queryByText('< previous');
                fireEvent.click(previousLink);

                await waitFor(() => {
                    const firstPageUser = queryByText('display1@user1');
                    expect(firstPageUser).toBeInTheDocument();
                })

            });
        });

        it('displays error message when loading other page fails', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValueOnce(mockSuccessGetMultiPageLast).mockRejectedValueOnce(mockFailGet);
            const {queryByText} = setup();
            await waitFor(async () => {
                const previousLink = queryByText('< previous');
                fireEvent.click(previousLink);

                await waitFor(() => {
                    const errorMessage = queryByText('User load failed');
                    expect(errorMessage).toBeInTheDocument();
                })

            });
        });

        it('hides error message when successfully loading other page ', async () => {
            apiCalls.listUsers = jest.fn()
                .mockResolvedValueOnce(mockSuccessGetMultiPageLast)
                .mockRejectedValueOnce(mockFailGet)
                .mockResolvedValue(mockSuccessGetMultiPageFirst);
            const {queryByText} = setup();
            await waitFor(async () => {
                const previousLink = queryByText('< previous');
                fireEvent.click(previousLink);
                await waitFor(async () => {
                    const errorMessage = queryByText('User load failed');
                    fireEvent.click(previousLink);
                    await waitFor(() => {
                        expect(errorMessage).not.toBeInTheDocument();
                    })
                })
            });
        });
    });
});
console.error = () => {
};