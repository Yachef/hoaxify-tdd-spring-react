package com.hoaxify.user;

import com.hoaxify.error.ApiError;
import com.hoaxify.shared.CurrentUser;
import com.hoaxify.user.vm.UserVM;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.AccessDeniedException;

@RestController
public class LoginController {

    @PostMapping("/api/1.0/login")
    UserVM handleLogin(@CurrentUser User loggedInUser) {
        return new UserVM(loggedInUser);
    }

    @ExceptionHandler({AccessDeniedException.class})
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    ApiError handleAccessDeniedException() {
        return new ApiError(HttpStatus.FORBIDDEN.value(), "Access error", "/api/1.0/login");
    }
}
