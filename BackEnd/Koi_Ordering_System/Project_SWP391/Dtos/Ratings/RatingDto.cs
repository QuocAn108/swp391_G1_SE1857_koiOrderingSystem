﻿using Project_SWP391.Model;

namespace Project_SWP391.Dtos.Ratings
{
    public class RatingDto
    {
        public string UserId { get; set; }
        public int FarmId { get; set; }
        public float Rate { get; set; }
        public string RatingDate { get; set; }
        public string Content { get; set; }
    }
}
