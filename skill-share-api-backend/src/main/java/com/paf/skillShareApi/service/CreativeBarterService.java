package com.paf.skillShareApi.service;

import com.paf.skillShareApi.controller.request.CreateRequestBoardRequestDTO;
import com.paf.skillShareApi.controller.request.UpdateRequestBoardRequestDTO;
import com.paf.skillShareApi.controller.request.UpdateBidRequestDTO;
import com.paf.skillShareApi.model.Bid;
import com.paf.skillShareApi.model.RequestBoard;

import java.util.List;

public interface CreativeBarterService {
    RequestBoard createRequest(CreateRequestBoardRequestDTO request);
    List<RequestBoard> getAllRequests();
    Bid submitBid(Long requestId, Long userId, String solution);
    void acceptBid(Long bidId, Long requestOwnerId);
    List<Bid> getBidsForRequest(Long requestId);
    RequestBoard updateRequest(Long requestId, UpdateRequestBoardRequestDTO request, Long userId);
    void deleteRequest(Long requestId, Long userId);
    Bid updateBid(Long bidId, UpdateBidRequestDTO request, Long userId);
    void deleteBid(Long bidId, Long userId);
}