package com.walkingdog.backend.controller;

import com.walkingdog.backend.dto.AuthResponse;
import com.walkingdog.backend.dto.ChangePasswordRequest;
import com.walkingdog.backend.dto.JoinRequest;
import com.walkingdog.backend.dto.LoginRequest;
import com.walkingdog.backend.dto.UpdateProfileRequest;
import com.walkingdog.backend.entity.User;
import com.walkingdog.backend.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/join")
    public ResponseEntity<AuthResponse> join(@RequestBody JoinRequest request) {
        try {
            User user = userService.join(request);

            return ResponseEntity.ok(AuthResponse.builder()
                    .success(true)
                    .message("회원가입이 완료되었습니다.")
                    .user(AuthResponse.UserInfo.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .name(user.getName())
                            .build())
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(AuthResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request, HttpSession session) {
        try {
            User user = userService.findByUsername(request.getUsername());

            // 비밀번호 확인
            if (!userService.validatePassword(request.getPassword(), user.getPassword())) {
                return ResponseEntity.badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("비밀번호가 일치하지 않습니다.")
                                .build());
            }

            // 세션에 사용자 정보 저장
            session.setAttribute("userId", user.getId());
            session.setAttribute("username", user.getUsername());
            session.setAttribute("user", user);

            return ResponseEntity.ok(AuthResponse.builder()
                    .success(true)
                    .message("로그인 성공")
                    .user(AuthResponse.UserInfo.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .name(user.getName())
                            .build())
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(AuthResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(AuthResponse.builder()
                .success(true)
                .message("로그아웃되었습니다.")
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.ok(AuthResponse.builder()
                    .success(false)
                    .message("로그인되지 않았습니다.")
                    .build());
        }

        return ResponseEntity.ok(AuthResponse.builder()
                .success(true)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .name(user.getName())
                        .build())
                .build());
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponse> updateProfile(
            @RequestBody UpdateProfileRequest request,
            HttpSession session) {
        try {
            User user = (User) session.getAttribute("user");
            if (user == null) {
                return ResponseEntity.badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("로그인이 필요합니다.")
                                .build());
            }

            User updatedUser = userService.updateProfile(
                    user.getId(),
                    request.getEmail(),
                    request.getName()
            );

            // 세션 업데이트
            session.setAttribute("user", updatedUser);

            return ResponseEntity.ok(AuthResponse.builder()
                    .success(true)
                    .message("회원정보가 수정되었습니다.")
                    .user(AuthResponse.UserInfo.builder()
                            .id(updatedUser.getId())
                            .username(updatedUser.getUsername())
                            .email(updatedUser.getEmail())
                            .name(updatedUser.getName())
                            .build())
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(AuthResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    @PutMapping("/password")
    public ResponseEntity<AuthResponse> changePassword(
            @RequestBody ChangePasswordRequest request,
            HttpSession session) {
        try {
            User user = (User) session.getAttribute("user");
            if (user == null) {
                return ResponseEntity.badRequest()
                        .body(AuthResponse.builder()
                                .success(false)
                                .message("로그인이 필요합니다.")
                                .build());
            }

            userService.changePassword(
                    user.getId(),
                    request.getCurrentPassword(),
                    request.getNewPassword()
            );

            return ResponseEntity.ok(AuthResponse.builder()
                    .success(true)
                    .message("비밀번호가 변경되었습니다.")
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(AuthResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }
}
