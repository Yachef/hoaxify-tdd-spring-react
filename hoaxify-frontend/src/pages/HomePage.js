import React from "react";
import UserList from "../components/UserList";

export class HomePage extends React.Component {
    render() {
        return (
            <div data-testid="homepage">
                <UserList></UserList>
            </div>
        );
    }
}

export default HomePage;