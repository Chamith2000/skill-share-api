package com.paf.skillShareApi.service.impl;

import com.paf.skillShareApi.controller.request.CreateRequestBoardRequestDTO;
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

    @Override
    public RequestBoard createRequest(CreateRequestBoardRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException(request.getUserId()));

        RequestBoard requestBoard = new RequestBoard();
        requestBoard.setTitle(request.getTitle());
        requestBoard.setDescription(request.getDescription());
        requestBoard.setUser(user);
        requestBoard.setCreatedAt(LocalDateTime.now());
        requestBoard.setIsResolved(false); // This should now work

        return requestBoardRepository.save(requestBoard);
    }

    @Override
    public List<RequestBoard> getAllRequests() {
        return requestBoardRepository.findAll();
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
        bid.setIsAccepted(false); // This should now work

        return bidRepository.save(bid);
    }

    @Override
    public void acceptBid(Long bidId, Long requestOwnerId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found with ID: " + bidId));
        RequestBoard requestBoard = bid.getRequestBoard();

        if (!requestBoard.getUser().getId().equals(requestOwnerId)) {
            throw new RuntimeException("Only the request owner can accept a bid");
        }

        bid.setIsAccepted(true); // This should now work
        requestBoard.setIsResolved(true); // This should now work

        // Award Craft Token to the bidder
        User bidder = bid.getUser();
        bidder.setCraftTokens(bidder.getCraftTokens() + 1);

        bidRepository.save(bid);
        requestBoardRepository.save(requestBoard);
        userRepository.save(bidder);
    }
}