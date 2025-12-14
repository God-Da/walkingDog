package com.walkingdog.backend.dto;

import lombok.Data;

@Data
public class JoinRequest {
    private String username;
    private String password;
    private String email;
    private String name;
}
