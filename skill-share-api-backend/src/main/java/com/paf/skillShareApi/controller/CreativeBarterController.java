package com.paf.skillShareApi.controller;

import com.paf.skillShareApi.controller.request.CreateRequestBoardRequestDTO;
import com.paf.skillShareApi.controller.request.UpdateRequestBoardRequestDTO;
import com.paf.skillShareApi.controller.request.UpdateBidRequestDTO;
import com.paf.skillShareApi.controller.response.BidDTO;
import com.paf.skillShareApi.model.Bid;
import com.paf.skillShareApi.model.RequestBoard;
import com.paf.skillShareApi.service.CreativeBarterService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/creative-barter")
@CrossOrigin(origins = "http://localhost:3000")
public class CreativeBarterController {

    @Autowired
    private CreativeBarterService creativeBarterService;

    // Existing endpoints...

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
    public ResponseEntity<BidDTO> submitBid(@PathVariable Long requestId,
                                            @RequestParam Long userId,
                                            @RequestParam String solution) {
        Bid bid = creativeBarterService.submitBid(requestId, userId, solution);
        return ResponseEntity.ok(BidDTO.fromBid(bid));
    }

    @GetMapping("/requests/{requestId}/bids")
    public ResponseEntity<List<BidDTO>> getBidsForRequest(@PathVariable Long requestId) {
        List<Bid> bids = creativeBarterService.getBidsForRequest(requestId);
        List<BidDTO> bidDTOs = bids.stream()
                .map(BidDTO::fromBid)
                .collect(Collectors.toList());
        return ResponseEntity.ok(bidDTOs);
    }

    @PostMapping("/bids/{bidId}/accept")
    public ResponseEntity<Void> acceptBid(@PathVariable Long bidId, @RequestParam Long requestOwnerId) {
        creativeBarterService.acceptBid(bidId, requestOwnerId);
        return ResponseEntity.ok().build();
    }

    // New endpoints for edit and delete

    @PutMapping("/requests/{requestId}")
    public ResponseEntity<RequestBoard> updateRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody UpdateRequestBoardRequestDTO request,
            @RequestParam Long userId) {
        RequestBoard updatedRequest = creativeBarterService.updateRequest(requestId, request, userId);
        return ResponseEntity.ok(updatedRequest);
    }

    @DeleteMapping("/requests/{requestId}")
    public ResponseEntity<Void> deleteRequest(
            @PathVariable Long requestId,
            @RequestParam Long userId) {
        creativeBarterService.deleteRequest(requestId, userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/bids/{bidId}")
    public ResponseEntity<BidDTO> updateBid(
            @PathVariable Long bidId,
            @Valid @RequestBody UpdateBidRequestDTO request,
            @RequestParam Long userId) {
        Bid updatedBid = creativeBarterService.updateBid(bidId, request, userId);
        return ResponseEntity.ok(BidDTO.fromBid(updatedBid));
    }

    @DeleteMapping("/bids/{bidId}")
    public ResponseEntity<Void> deleteBid(
            @PathVariable Long bidId,
            @RequestParam Long userId) {
        creativeBarterService.deleteBid(bidId, userId);
        return ResponseEntity.ok().build();
    }
}