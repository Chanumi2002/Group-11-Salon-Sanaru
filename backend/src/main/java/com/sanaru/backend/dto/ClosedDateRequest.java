package com.sanaru.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClosedDateRequest {
    private LocalDate closedDate;
    private String reason;
    private Boolean isActive = true;
}
