<?php
abstract class AbstractEvent {
    protected $id;
    protected $time;
    protected $sport;
    protected $placard;

    public function __construct(?string $time = null, ?string $sport = null, ?AbstractPlacard $placard = null) {
        $this->time = $time;
        $this->sport = $sport;
        $this->placard = $placard;
    }

    public function loadFromDatabase($conn, $id) {
        throw new Exception("Method 'loadFromDatabase' must be implemented in the child class.");
    }

    public function saveToDatabase($conn) {
        throw new Exception("Method 'saveToDatabase' must be implemented in the child class.");

    }

    public function getId() {
        return $this->id;
    }

    public function setId($id) {
        $this->id = $id;
    }

    public function getTime() {
        return $this->time;
    }
}
?>
