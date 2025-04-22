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

    public function loadFromDatabase($conn, $id) {}

    public function saveToDatabase($conn) {}

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
