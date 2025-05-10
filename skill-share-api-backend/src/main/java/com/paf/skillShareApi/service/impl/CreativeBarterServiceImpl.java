package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.controller.request.CreateRequestBoardRequestDTO;
import com.paf.skillShareApi.controller.request.UpdateRequestBoardRequestDTO;
import com.paf.skillShareApi.controller.request.UpdateBidRequestDTO;
import com.paf.skillShareApi.exception.UserNotFoundException;
import com.paf.skillShareApi.model.Bid;
import com.paf.skillShareApi.model.RequestBoard;
import com.paf.skillShareApi.model.User;
import com.paf.skillShareApi.repository.BidRepository;
import com.paf.skillShareApi.repository.RequestBoardRepository;
import com.paf.skillShareApi.repository.UserRepository;
import com.paf.skillShareApi.service.CreativeBarterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CreativeBarterServiceImpl implements CreativeBarterService {

    @Autowired
    private RequestBoardRepository requestBoardRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private UserRepository userRepository;

    // Existing methods...

    @Override
    public RequestBoard createRequest(CreateRequestBoardRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException(request.getUserId()));

        RequestBoard requestBoard = new RequestBoard();
        requestBoard.setTitle(request.getTitle());
        requestBoard.setDescription(request.getDescription());
        requestBoard.setUser(user);
        requestBoard.setCreatedAt(LocalDateTime.now());
        requestBoard.setIsResolved(false);

        return requestBoardRepository.save(requestBoard);
    }

    @Override
    public List<RequestBoard> getAllRequests() {
        return requestBoardRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Bid> getBidsForRequest(Long requestId) {
        List<Bid> bids = bidRepository.findByRequestBoardId(requestId);
        bids.forEach(bid -> {
            if (bid.getUser() != null) {
                bid.getUser().getUsername();
            }
        });
        return bids;
    }

    @Override
    public Bid submitBid(Long requestId, Long userId, String solution) {
        RequestBoard requestBoard = requestBoardRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with ID: " + requestId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Bid bid = new Bid();
        bid.setRequestBoard(requestBoard);
        bid.setUser(user);
        bid.setSolution(solution);
        bid.setCreatedAt(LocalDateTime.now());
        bid.setIsAccepted(false);

        return bidRepository.save(bid);
    }

    @Override
    @Transactional
    public void acceptBid(Long bidId, Long requestOwnerId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found with ID: " + bidId));
        RequestBoard requestBoard = bid.getRequestBoard();

        if (!requestBoard.getUser().getId().equals(requestOwnerId)) {
            throw new RuntimeException("Only the request owner can accept a bid");
        }

        bid.setIsAccepted(true);
        requestBoard.setIsResolved(true);

        User bidder = bid.getUser();
        bidder.setCraftTokens(bidder.getCraftTokens() + 1);

        bidRepository.save(bid);
        requestBoardRepository.save(requestBoard);
        userRepository.save(bidder);
    }

    // New methods

    @Override
    @Transactional
    public RequestBoard updateRequest(Long requestId, UpdateRequestBoardRequestDTO request, Long userId) {
        RequestBoard requestBoard = requestBoardRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with ID: " + requestId));

        if (!requestBoard.getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the request owner can update this request");
        }

        if (requestBoard.getIsResolved()) {
            throw new RuntimeException("Cannot update a resolved request");
        }

        requestBoard.setTitle(request.getTitle());
        requestBoard.setDescription(request.getDescription());
        requestBoard.setUpdatedAt(LocalDateTime.now());

        return requestBoardRepository.save(requestBoard);
    }

    @Override
    @Transactional
    public void deleteRequest(Long requestId, Long userId) {
        RequestBoard requestBoard = requestBoardRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with ID: " + requestId));

        if (!requestBoard.getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the request owner can delete this request");
        }

        // Delete associated bids first
        bidRepository.deleteByRequestBoardId(requestId);
        requestBoardRepository.delete(requestBoard);
    }

    @Override
    @Transactional
    public Bid updateBid(Long bidId, UpdateBidRequestDTO request, Long userId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found with ID: " + bidId));

        if (!bid.getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the bidder can update this bid");
        }

        if (bid.getIsAccepted()) {
            throw new RuntimeException("Cannot update an accepted bid");
        }

        if (bid.getRequestBoard().getIsResolved()) {
            throw new RuntimeException("Cannot update a bid for a resolved request");
        }

        bid.setSolution(request.getSolution());
        bid.setUpdatedAt(LocalDateTime.now());

        return bidRepository.save(bid);
    }

    @Override
    @Transactional
    public void deleteBid(Long bidId, Long userId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found with ID: " + bidId));

        if (!bid.getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the bidder can delete this bid");
        }

        if (bid.getIsAccepted()) {
            throw new RuntimeException("Cannot delete an accepted bid");
        }

        bidRepository.delete(bid);
    }
}