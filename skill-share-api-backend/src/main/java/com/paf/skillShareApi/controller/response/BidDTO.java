package com.paf.skillShareApi.controller.response;

import com.paf.skillShareApi.model.Bid;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
public class BidDTO {
    private Long id;
    private String solution;
    private LocalDateTime createdAt;
    private boolean isAccepted;
    private Map<String, Object> user;
    private Long requestBoardId;

    public static BidDTO fromBid(Bid bid) {
        BidDTO dto = new BidDTO();
        dto.setId(bid.getId());
        dto.setSolution(bid.getSolution());
        dto.setCreatedAt(bid.getCreatedAt());
        dto.setAccepted(bid.isAccepted());

        // Set user details as a map to avoid conflicts with existing UserDTO
        if (bid.getUser() != null) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", bid.getUser().getId());
            userMap.put("username", bid.getUser().getUsername());
            dto.setUser(userMap);
        }

        // Set request board ID
        if (bid.getRequestBoard() != null) {
            dto.setRequestBoardId(bid.getRequestBoard().getId());
        }

        return dto;
    }
}