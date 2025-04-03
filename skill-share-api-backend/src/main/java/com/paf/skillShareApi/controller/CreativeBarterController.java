package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.controller.request.CreateRequestBoardRequestDTO;
import com.paf.skillShareApi.model.Bid;
import com.paf.skillShareApi.model.RequestBoard;
import com.paf.skillShareApi.service.CreativeBarterService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/creative-barter")
@CrossOrigin(origins = "http://localhost:3000")
public class CreativeBarterController {

    @Autowired
    private CreativeBarterService creativeBarterService;

    @PostMapping("/requests")
    public ResponseEntity<RequestBoard> createRequest(@Valid @RequestBody CreateRequestBoardRequestDTO request) {
        RequestBoard requestBoard = creativeBarterService.createRequest(request);
        return ResponseEntity.ok(requestBoard);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<RequestBoard>> getAllRequests() {
        List<RequestBoard> requests = creativeBarterService.getAllRequests();
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/requests/{requestId}/bids")
    public ResponseEntity<Bid> submitBid(@PathVariable Long requestId,
                                         @RequestParam Long userId,
                                         @RequestParam String solution) {
        Bid bid = creativeBarterService.submitBid(requestId, userId, solution);
        return ResponseEntity.ok(bid);
    }

    @PostMapping("/bids/{bidId}/accept")
    public ResponseEntity<Void> acceptBid(@PathVariable Long bidId, @RequestParam Long requestOwnerId) {
        creativeBarterService.acceptBid(bidId, requestOwnerId);
        return ResponseEntity.ok().build();
    }
}