package com.sanaru.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
public class Holiday {
    
    private String uid;
    
    private String summary;
    
    private List<String> categories;
    
    @JsonProperty("start")
    private LocalDate startDate;
    
    @JsonProperty("end")
    private LocalDate endDate;
}
