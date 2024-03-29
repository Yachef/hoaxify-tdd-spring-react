package com.hoaxify.user.vm;

import com.hoaxify.user.User;
import lombok.Data;

@Data
public class UserVM {

    private long id;

    private String username;

    private String displayName;

    private String image;

    public UserVM(User user) {
        this.setId(user.getId());
        this.setUsername(user.getUsername());
        this.setDisplayName(user.getDisplayName());
        this.setImage(user.getImage());
    }
}
