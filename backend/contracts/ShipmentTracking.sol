// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ShipmentTracking {
    enum Status { Created, PickedUp, InTransit, Warehouse, OutForDelivery, Delivered, Cancelled }

    struct Shipment {
        uint256 id;
        string trackingId;
        address sender;
        address carrier;
        address receiver;
        Status status;
        uint256 createdAt;
        uint256 updatedAt;
        bool exists;
    }

    struct ShipmentEvent {
        Status status;
        address updatedBy;
        uint256 timestamp;
        string note;
    }

    uint256 private _shipmentCounter;

    mapping(uint256 => Shipment) public shipments;
    mapping(uint256 => ShipmentEvent[]) public shipmentEvents;
    mapping(string => uint256) public trackingIdToId;

    event ShipmentCreated(uint256 indexed id, string trackingId, address indexed sender, uint256 timestamp);
    event StatusUpdated(uint256 indexed id, Status status, address indexed updatedBy, uint256 timestamp);
    event OwnershipTransferred(uint256 indexed id, address indexed from, address indexed to, uint256 timestamp);
    event DeliveryConfirmed(uint256 indexed id, address indexed confirmedBy, uint256 timestamp);

    modifier onlyExists(uint256 _id) {
        require(shipments[_id].exists, "Shipment does not exist");
        _;
    }

    modifier notDeliveredOrCancelled(uint256 _id) {
        require(
            shipments[_id].status != Status.Delivered && shipments[_id].status != Status.Cancelled,
            "Shipment is already finalized"
        );
        _;
    }

    // Feature 3 & 4: Create shipment on blockchain
    function createShipment(
        string memory _trackingId,
        address _carrier,
        address _receiver
    ) external returns (uint256) {
        _shipmentCounter++;
        uint256 id = _shipmentCounter;

        shipments[id] = Shipment({
            id: id,
            trackingId: _trackingId,
            sender: msg.sender,
            carrier: _carrier,
            receiver: _receiver,
            status: Status.Created,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            exists: true
        });

        trackingIdToId[_trackingId] = id;

        shipmentEvents[id].push(ShipmentEvent({
            status: Status.Created,
            updatedBy: msg.sender,
            timestamp: block.timestamp,
            note: "Shipment created"
        }));

        emit ShipmentCreated(id, _trackingId, msg.sender, block.timestamp);
        return id;
    }

    // Feature 4: Update shipment status
    function updateStatus(
        uint256 _id,
        Status _status,
        string memory _note
    ) external onlyExists(_id) notDeliveredOrCancelled(_id) {
        require(
            msg.sender == shipments[_id].sender ||
            msg.sender == shipments[_id].carrier,
            "Not authorized"
        );

        shipments[_id].status = _status;
        shipments[_id].updatedAt = block.timestamp;

        shipmentEvents[_id].push(ShipmentEvent({
            status: _status,
            updatedBy: msg.sender,
            timestamp: block.timestamp,
            note: _note
        }));

        emit StatusUpdated(_id, _status, msg.sender, block.timestamp);
    }

    // Feature 4: Transfer ownership (carrier handoff)
    function transferOwnership(
        uint256 _id,
        address _newCarrier
    ) external onlyExists(_id) notDeliveredOrCancelled(_id) {
        require(msg.sender == shipments[_id].carrier || msg.sender == shipments[_id].sender, "Not authorized");

        address oldCarrier = shipments[_id].carrier;
        shipments[_id].carrier = _newCarrier;
        shipments[_id].updatedAt = block.timestamp;

        emit OwnershipTransferred(_id, oldCarrier, _newCarrier, block.timestamp);
    }

    // Feature 4: Confirm delivery
    function confirmDelivery(uint256 _id) external onlyExists(_id) notDeliveredOrCancelled(_id) {
        require(
            msg.sender == shipments[_id].carrier ||
            msg.sender == shipments[_id].receiver ||
            msg.sender == shipments[_id].sender,
            "Not authorized"
        );

        shipments[_id].status = Status.Delivered;
        shipments[_id].updatedAt = block.timestamp;

        shipmentEvents[_id].push(ShipmentEvent({
            status: Status.Delivered,
            updatedBy: msg.sender,
            timestamp: block.timestamp,
            note: "Delivery confirmed"
        }));

        emit DeliveryConfirmed(_id, msg.sender, block.timestamp);
    }

    // Feature 4: Cancel shipment
    function cancelShipment(uint256 _id) external onlyExists(_id) notDeliveredOrCancelled(_id) {
        require(msg.sender == shipments[_id].sender, "Only sender can cancel");

        shipments[_id].status = Status.Cancelled;
        shipments[_id].updatedAt = block.timestamp;

        shipmentEvents[_id].push(ShipmentEvent({
            status: Status.Cancelled,
            updatedBy: msg.sender,
            timestamp: block.timestamp,
            note: "Shipment cancelled"
        }));

        emit StatusUpdated(_id, Status.Cancelled, msg.sender, block.timestamp);
    }

    // Feature 3: Get shipment events (immutable history)
    function getShipmentEvents(uint256 _id) external view onlyExists(_id) returns (ShipmentEvent[] memory) {
        return shipmentEvents[_id];
    }

    // Feature 3: Get shipment by trackingId
    function getShipmentByTrackingId(string memory _trackingId) external view returns (Shipment memory) {
        uint256 id = trackingIdToId[_trackingId];
        require(shipments[id].exists, "Shipment not found");
        return shipments[id];
    }

    function totalShipments() external view returns (uint256) {
        return _shipmentCounter;
    }
}
