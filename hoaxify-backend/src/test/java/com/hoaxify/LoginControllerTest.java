package com.hoaxify;

import com.hoaxify.error.ApiError;
import com.hoaxify.user.User;
import com.hoaxify.user.UserRepository;
import com.hoaxify.user.UserService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class LoginControllerTest {

    private static final String API_1_0_LOGIN = "/api/1.0/login";

    @Autowired
    private TestRestTemplate testRestTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Before
    public void cleanup() {
        userRepository.deleteAll();
        testRestTemplate.getRestTemplate().getInterceptors().clear();
    }

    @Test
    public void postLogin_withoutUserCredentials_receiveUnauthorized() {
        ResponseEntity<Object> response = sendLoginRequest(Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void postLogin_withoutUserCredentials_receiveApiError() {
        ResponseEntity<ApiError> response = sendLoginRequest(ApiError.class);
        assertThat(response.getBody().getUrl()).isEqualTo(API_1_0_LOGIN);
    }

    @Test
    public void postLogin_withoutUserCredentials_receiveApiErrorWithoutValidationErrors() {
        ResponseEntity<String> response = sendLoginRequest(String.class);
        assertThat(response.getBody().contains("validationErrors")).isFalse();
    }

    @Test
    public void postLogin_withIncorrectCredentials_receiveUnauthorized() {
        addAuthenticationHeader();
        ResponseEntity<Object> response = sendLoginRequest(Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void postLogin_withIncorrectCredentials_receiveUnauthorizedWithoutWWWAuthenticationHeader() {
        addAuthenticationHeader();
        ResponseEntity<Object> response = sendLoginRequest(Object.class);
        assertThat(response.getHeaders().containsKey("WWW-Authenticate")).isFalse();
    }

    @Test
    public void postLogin_withValidCredentials_receiveOk() {
        User user =TestUtil.createValidUser();

        userService.save(user);

        addAuthenticationHeader();
        ResponseEntity<Object> response = sendLoginRequest(Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void postLogin_withValidCredentials_receiveLoggedInUserId() {
        User user =TestUtil.createValidUser();
        User inDB = userService.save(user);
        addAuthenticationHeader();
        ResponseEntity<Map<String, Object>> response = sendLoginRequest(new ParameterizedTypeReference<>() {});

        Map<String, Object> body = response.getBody();
        Integer id = (Integer) body.get("id");
        assertThat(id).isEqualTo(inDB.getId());
    }

    @Test
    public void postLogin_withValidCredentials_receiveLoggedInUserImage() {
        User user =TestUtil.createValidUser();
        User inDB = userService.save(user);
        addAuthenticationHeader();
        ResponseEntity<Map<String, Object>> response = sendLoginRequest(new ParameterizedTypeReference<>() {});

        Map<String, Object> body = response.getBody();
        String image = (String) body.get("image");
        assertThat(image).isEqualTo(inDB.getImage());
    }

    @Test
    public void postLogin_withValidCredentials_receiveLoggedInUserDisplayName() {
        User user =TestUtil.createValidUser();
        User inDB = userService.save(user);
        addAuthenticationHeader();
        ResponseEntity<Map<String, Object>> response = sendLoginRequest(new ParameterizedTypeReference<>() {});

        Map<String, Object> body = response.getBody();
        String displayName = (String) body.get("displayName");
        assertThat(displayName).isEqualTo(inDB.getDisplayName());
    }

    @Test
    public void postLogin_withValidCredentials_receiveLoggedInUserUsername() {
        User user =TestUtil.createValidUser();
        User inDB = userService.save(user);
        addAuthenticationHeader();
        ResponseEntity<Map<String, Object>> response = sendLoginRequest(new ParameterizedTypeReference<>() {});

        Map<String, Object> body = response.getBody();
        String username = (String) body.get("username");
        assertThat(username).isEqualTo(inDB.getUsername());
    }


    @Test
    public void postLogin_withValidCredentials_notReceiveLoggedInUsersPassword() {
        User user =TestUtil.createValidUser();
        userService.save(user);
        addAuthenticationHeader();
        ResponseEntity<Map<String, Object>> response = sendLoginRequest(new ParameterizedTypeReference<>() {});

        Map<String, Object> body = response.getBody();
        assertThat(body.containsKey("password")).isFalse();
    }

    private void addAuthenticationHeader() {
        testRestTemplate.getRestTemplate().getInterceptors().add(new BasicAuthenticationInterceptor("test-user", "P4ssword"));
    }

    public <T> ResponseEntity<T> sendLoginRequest(Class<T> responseType) {
        return testRestTemplate.postForEntity(API_1_0_LOGIN, null, responseType);
    }

    public <T> ResponseEntity<T> sendLoginRequest(ParameterizedTypeReference<T> responseType) {
        return testRestTemplate.exchange(API_1_0_LOGIN, HttpMethod.POST, null, responseType);
    }

}
